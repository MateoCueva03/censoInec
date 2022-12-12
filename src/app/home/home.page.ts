
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AvatarService } from '../services/avatar.service';
import { ChatService } from '../services/chat.service';
import { FirestoreService } from '../services/firestore.service';
import { InteractionService } from '../services/interaction.service';
import { Datos } from './models/models';

import { Geolocation } from '@capacitor/geolocation';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  profile = null;

  latitud: any;
  longitud:any ;
  coords: any;

  datos: Datos[] = [];
  data: Datos = {

    informacionUsuario: {
      nombre: 'Mateo Cueva',
      cedula: '1727571083',
      telefono: 983978688
    },
    informacionCensado: {
      nombre: '',
      cedula: '',
      miembros: null,
      fotos: '',
      latitud: '',
      longitud: '',
      // coords: '',
      id: ''
    }

  }
  newFile: any;

  constructor(
    private chatService: ChatService,
    private avatarService: AvatarService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private firestore: FirestoreService,
    private interaction: InteractionService,
    private modalController: ModalController
  ) {
    this.avatarService.getUserProfile().subscribe((data) => {
      this.profile = data;
    });
  }

  ngOnInit() {
    // console.log('dr crep la visra');
    this.getDatos();

  }

  async logout() {
    await this.authService.logout();
    this.router.navigateByUrl('/', { replaceUrl: true });
  }


  signOut() {
    this.authService.logout().then(() => {
      this.router.navigateByUrl('/', { replaceUrl: true });
    });
  }

  async changeImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos, // Camera, Photos or Prompt!
    });

    if (image) {
      const loading = await this.loadingController.create();
      await loading.present();

      const result = await this.avatarService.uploadImage(image);
      loading.dismiss();

      if (!result) {
        const alert = await this.alertController.create({
          header: 'Upload failed',
          message: 'There was a problem uploading your avatar.',
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }

  crearNuevoResultado() {

    this.interaction.showLoading('Guardando ...')
    const path = 'censo';
    const id = this.firestore.getId();
    this.data.informacionCensado.id = id;
    this.firestore.createDoc(this.data, path, id).then((res) => {
      console.log('guardado con exito');
      this.interaction.closeLoading();
      this.interaction.presentToast('Guardado con exito')

    })
  }

  getDatos() {
    this.firestore.getCollection<Datos>('users').subscribe(res => {
      console.log('la lectura', res);
      this.datos = res;

    })
  }



  async newImageUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newFile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = ((image) => {
        this.data.informacionCensado.fotos = image.target.result as string;
      });
      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async addDirection() {
    const coordinates = await Geolocation.getCurrentPosition();
    this.latitud=coordinates.coords.latitude;
    this.longitud=coordinates.coords.longitude;

    console.log('data -> ', this.data);
    this.data.informacionCensado.latitud = this.latitud;
    this.data.informacionCensado.longitud = this.longitud;
    console.log('this.cliente -> ', this.data.informacionCensado.latitud);
    console.log('this.cliente -> ', this.data.informacionCensado.longitud);

  }

  // async locate(){
  //   const coordinates = await Geolocation.getCurrentPosition();
  //   this.latitud=coordinates.coords.latitude;
  //   this.longitud=coordinates.coords.longitude;
  // }

}

